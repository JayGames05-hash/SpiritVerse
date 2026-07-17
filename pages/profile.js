import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import readings from '../data/readings'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [myQuestions, setMyQuestions] = useState([])
  const [myAnswers, setMyAnswers] = useState([])
  const [historyEntries, setHistoryEntries] = useState([])
  const [favoriteItems, setFavoriteItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('questions')
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallBtn, setShowInstallBtn] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)
  const [pushPermission, setPushPermission] = useState('default')
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [pushMessage, setPushMessage] = useState('')
  const [scheduleMessage, setScheduleMessage] = useState('')
  const [scheduleSaving, setScheduleSaving] = useState(false)
  const [notificationSchedule, setNotificationSchedule] = useState('every_2_hours')
  const [debugInfo, setDebugInfo] = useState({
    swRegistered: false,
    swScope: '',
    notificationPermission: 'default',
    subscriptionEndpoint: '',
    subscriptionKeys: '',
  })
  const [debugLoading, setDebugLoading] = useState(false)

 

  useEffect(() => {
    async function loadProfileData() {
      try {
        const userRes = await fetch('/api/auth/user', { credentials: 'include' })
        const userData = await userRes.json()
        if (!userData.user) {
          router.push('/signin')
          return
        }
        setUser(userData.user)
        setNotificationSchedule(userData.user.notification_schedule || 'every_2_hours')

        const [questionsRes, answersRes, historyRes, favoritesRes] = await Promise.all([
          fetch('/api/questions', { credentials: 'include' }),
          fetch('/api/answers/user', { credentials: 'include' }),
          fetch('/api/history', { credentials: 'include' }),
          fetch('/api/favorites', { credentials: 'include' }),
        ])

        const questionsData = await questionsRes.json()
        const answersData = await answersRes.json()
        const historyData = await historyRes.json()
        const favoritesData = await favoritesRes.json()

        setMyQuestions((questionsData.questions || []).filter(q => q.author_id === userData.user?.id))
        setMyAnswers(answersData.answers || [])

        const favoriteIds = (favoritesData.favorites || []).map(f => f.post_id)
        const favoritePosts = favoriteIds
          .map(id => readings.find(reading => reading.id === id))
          .filter(Boolean)
        setFavoriteItems(favoritePosts)

        setHistoryEntries(historyData.history || [])
      } catch (err) {
        console.error('Failed to load profile data:', err)
        router.push('/signin')
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [router])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const beforeInstallHandler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBtn(true)
    }

    const appInstalledHandler = () => {
      setDeferredPrompt(null)
      setShowInstallBtn(false)
    }

    window.addEventListener('beforeinstallprompt', beforeInstallHandler)
    window.addEventListener('appinstalled', appInstalledHandler)

    // Detect iOS for manual install instructions
    const ua = navigator.userAgent || ''
    const isiOS = /iP(ad|hone|od)/.test(ua)
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches
    setIsIos(isiOS && !isStandalone)
    if (isiOS && !isStandalone) setShowInstallBtn(true)

    // Exposed small helper to refresh push subscription/permission state
    const checkPushSupport = async () => {
      try {
        const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
        setPushSupported(supported)
        setPushPermission(Notification.permission)
        if (!supported) return

        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setPushEnabled(Boolean(subscription))
      } catch (err) {
        console.warn('Error checking push support:', err)
        setPushSupported(false)
        setPushEnabled(false)
      }
    }

    checkPushSupport()

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler)
      window.removeEventListener('appinstalled', appInstalledHandler)
    }
  }, [])

  useEffect(() => {
    // Refresh debug info on mount
    if (typeof window !== 'undefined') {
      try {
        (async () => {
          const swReg = await navigator.serviceWorker.getRegistration()
          const sub = swReg ? await swReg.pushManager.getSubscription() : null
          setDebugInfo({
            swRegistered: !!swReg,
            swScope: swReg?.scope || 'N/A',
            notificationPermission: Notification.permission,
            subscriptionEndpoint: sub?.endpoint ? sub.endpoint.substring(0, 50) + '...' : 'Not subscribed',
            subscriptionKeys: sub ? `p256dh: ${sub.getKey('p256dh') ? 'present' : 'missing'}, auth: ${sub.getKey('auth') ? 'present' : 'missing'}` : 'N/A',
          })
        })()
      } catch (err) {
        console.error('Failed to load debug info on mount:', err)
      }
    }
  }, [])

  const handleViewQuestion = id => {
    router.push(`/question/${id}`)
  }

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const handlePushSubscription = async () => {
    if (!pushSupported) {
      setPushMessage('Notifications are not supported in this browser.')
      return
    }

    setPushLoading(true)
    setPushMessage('')

    try {
      let permission = Notification.permission
      if (permission !== 'granted') {
        permission = await Notification.requestPermission()
        setPushPermission(permission)
      }

      if (permission !== 'granted') {
        setPushMessage('Please allow notifications to enable reminders.')
        return
      }

      const vapidRes = await fetch('/api/notifications/vapid', { credentials: 'include' })
      const vapidData = await vapidRes.json()
      if (!vapidRes.ok || !vapidData.publicKey) {
        throw new Error(vapidData.error || 'Unable to get VAPID public key.')
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey),
      })

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save subscription.')
      }

      setPushEnabled(true)
      setPushMessage('Notifications enabled. You will receive verse reminders.')

      // Send a quick test notification immediately so users can verify it's working
      try {
        const testRes = await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title: 'Test reminder', body: 'Notifications are enabled — this is a test.', url: '/' }),
        })
        const testJson = await testRes.json()
        if (!testRes.ok) {
          console.warn('Test notification failed:', testJson)
        }
      } catch (err) {
        console.warn('Failed to send test notification after subscribe:', err)
      }
    } catch (err) {
      console.error('Push subscription failed:', err)
      setPushMessage(err.message || 'Failed to enable notifications.')
    } finally {
      setPushLoading(false)
    }
  }

  const handleSendTestNotification = async () => {
    // Intentionally left blank — test notifications removed.
  }

  const saveNotificationSchedule = async (value) => {
    setNotificationSchedule(value)
    setScheduleSaving(true)
    setScheduleMessage('')

    try {
      const res = await fetch('/api/auth/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notification_schedule: value }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update notification schedule')
      }
      setUser(data.user)
      setScheduleMessage('Notification schedule updated.')
    } catch (err) {
      console.error('Failed to update notification schedule:', err)
      setScheduleMessage(err.message || 'Failed to save schedule.')
    } finally {
      setScheduleSaving(false)
      setTimeout(() => setScheduleMessage(''), 3000)
    }
  }

  const refreshDebugInfo = async () => {
    setDebugLoading(true)
    try {
      const swReg = await navigator.serviceWorker.getRegistration()
      const sub = swReg ? await swReg.pushManager.getSubscription() : null
      setDebugInfo({
        swRegistered: !!swReg,
        swScope: swReg?.scope || 'N/A',
        notificationPermission: Notification.permission,
        subscriptionEndpoint: sub?.endpoint ? sub.endpoint.substring(0, 50) + '...' : 'Not subscribed',
        subscriptionKeys: sub ? `p256dh: ${sub.getKey('p256dh') ? 'present' : 'missing'}, auth: ${sub.getKey('auth') ? 'present' : 'missing'}` : 'N/A',
      })
    } catch (err) {
      console.error('Failed to refresh debug info:', err)
      setDebugInfo(prev => ({ ...prev }))
    } finally {
      setDebugLoading(false)
    }
  }

  const handleSendDebugTestNotification = async () => {
    setPushLoading(true)
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: 'Debug test notification',
          body: 'This is a test from the profile debug panel.',
          url: '/',
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setPushMessage(`Send failed: ${json.error || res.statusText}`)
      } else {
        setPushMessage('Test sent — check your device.')
      }
      setTimeout(() => setPushMessage(''), 3000)
    } catch (err) {
      console.error('Debug test send failed:', err)
      setPushMessage(err.message || 'Test send failed')
      setTimeout(() => setPushMessage(''), 3000)
    } finally {
      setPushLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
        <Header />
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center text-white">Loading...</div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#4b2d23] mb-2">{user.full_name || user.email}</h1>
            {user.is_admin && (
              <div className="flex items-center gap-3">
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">Admin</span>
                <button
                  onClick={() => router.push('/admin')}
                  className="bg-[#8b1e1e] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#7a1c1c]"
                >
                  Admin Dashboard
                </button>
              </div>
            )}
          </div>
          {user.saint_name && (
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">Saint Name:</span> {user.saint_name}
            </p>
          )}
          <p className="text-gray-600">
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <p className="text-gray-600 mb-6">
            <span className="font-semibold">Member since:</span>{' '}
            {new Date(user.created_at).toLocaleDateString()}
          </p>
          <div className="bg-[#f8fafc] rounded-3xl p-5 border border-gray-200">
            <h2 className="text-xl font-semibold text-[#4b2d23] mb-3">Verse Settings</h2>
            <p className="text-gray-600 mb-6">All users see the same verse on a 2-hour cycle to discuss together.</p>
            <div className="mt-4 space-y-4">
              {showInstallBtn && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    onClick={async () => {
                      if (deferredPrompt) {
                        deferredPrompt.prompt()
                        const choice = await deferredPrompt.userChoice
                        if (choice && choice.outcome === 'accepted') {
                          setShowInstallBtn(false)
                        }
                        setDeferredPrompt(null)
                      } else if (isIos) {
                        alert('To install on iOS: tap Share → Add to Home Screen in Safari.')
                      } else {
                        alert('Your browser does not support the automatic install prompt.')
                      }
                    }}
                    className="bg-[#4b2d23] text-white px-4 py-2 rounded-2xl font-semibold"
                  >
                    Add to Home Screen
                  </button>
                  <span className="text-sm text-gray-500">Install the app for quick access.</span>
                </div>
              )}
              <div className="rounded-3xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#4b2d23]">Verse reminder notifications</h3>
                    <p className="text-gray-600 text-sm">
                      Enable browser notifications to receive an alert when your next verse is ready.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <span className="text-sm text-gray-500">
                        {pushSupported
                          ? pushPermission === 'granted'
                            ? pushEnabled
                              ? 'Notifications are enabled.'
                              : 'Ready to subscribe.'
                            : 'Permission required.'
                          : 'Notifications are not supported in this browser.'}
                      </span>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handlePushSubscription}
                          disabled={pushLoading || !pushSupported}
                          className="bg-[#8b1e1e] text-white px-4 py-2 rounded-2xl font-semibold disabled:opacity-50"
                        >
                          {pushEnabled ? 'Refresh notifications' : 'Enable notifications'}
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
                      <div>
                        <label className="block text-sm font-semibold text-[#4b2d23] mb-2">Reminder schedule</label>
                        <select
                          value={notificationSchedule}
                          onChange={(e) => saveNotificationSchedule(e.target.value)}
                          disabled={scheduleSaving}
                          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-700 focus:border-[#8b1e1e] focus:ring-2 focus:ring-[#f2e3d3]"
                        >
                          <option value="every_2_hours">Every 2 hours</option>
                          <option value="morning_evening">Morning + evening</option>
                        </select>
                      </div>
                      <div className="text-sm text-gray-500">{scheduleSaving ? 'Saving…' : scheduleMessage || 'Choose when reminders arrive.'}</div>
                    </div>
                  </div>
                  {pushMessage && <p className="text-sm text-red-600">{pushMessage}</p>}
                </div>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-4">
                <details className="cursor-pointer">
                  <summary className="text-lg font-semibold text-[#4b2d23]">Debug: Push Notifications</summary>
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <p><strong>Service Worker:</strong> {debugInfo.swRegistered ? '✓ Registered' : '✗ Not registered'}</p>
                    {debugInfo.swScope && <p><strong>Scope:</strong> {debugInfo.swScope}</p>}
                    <p><strong>Notification Permission:</strong> {debugInfo.notificationPermission}</p>
                    <p><strong>Subscription Endpoint:</strong> {debugInfo.subscriptionEndpoint}</p>
                    <p><strong>Subscription Keys:</strong> {debugInfo.subscriptionKeys}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={refreshDebugInfo}
                        disabled={debugLoading}
                        className="bg-gray-400 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                      >
                        Refresh Debug Info
                      </button>
                      <button
                        onClick={handleSendDebugTestNotification}
                        disabled={debugLoading}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                      >
                        Send Debug Test
                      </button>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'questions'
                ? 'bg-white text-[#4b2d23]'
                : 'bg-[#5a211f] text-white hover:bg-[#7a1c1c]'
            }`}
          >
            My Questions ({myQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('answers')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'answers'
                ? 'bg-white text-[#4b2d23]'
                : 'bg-[#5a211f] text-white hover:bg-[#7a1c1c]'
            }`}
          >
            My Answers ({myAnswers.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'history'
                ? 'bg-white text-[#4b2d23]'
                : 'bg-[#5a211f] text-white hover:bg-[#7a1c1c]'
            }`}
          >
            History ({historyEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'favorites'
                ? 'bg-white text-[#4b2d23]'
                : 'bg-[#5a211f] text-white hover:bg-[#7a1c1c]'
            }`}
          >
            Favorites ({favoriteItems.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'questions' && (
          <div>
            {myQuestions.length === 0 ? (
              <div className="bg-[#5a211f] rounded-3xl p-6 sm:p-8 text-white text-center">
                <p className="mb-4">You haven't asked any questions yet.</p>
                <button
                  onClick={() => router.push('/ask')}
                  className="bg-white text-[#4b2d23] px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
                >
                  Ask a Question
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {myQuestions.map(q => (
                  <div key={q.id} className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition">
                    <h3 className="text-xl font-bold text-[#4b2d23] mb-2">{q.title}</h3>
                    <p className="text-gray-700 mb-4 line-clamp-2">{q.content}</p>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                      <span className="text-xs text-gray-500">
                        {new Date(q.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleViewQuestion(q.id)}
                        className="text-[#8b1e1e] font-semibold hover:text-[#6d1b1b]"
                      >
                        View & Manage →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {activeTab === 'history' && (
          <div>
            {historyEntries.length === 0 ? (
              <div className="bg-[#5a211f] rounded-3xl p-6 sm:p-8 text-white text-center">
                <p className="mb-4">Your reading history is empty.</p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-white text-[#4b2d23] px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
                >
                  View Today’s Reading
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {historyEntries.map((entry) => {
                  const reading = readings.find((item) => item.id === entry.post_id)
                  return (
                    <div key={`${entry.post_id}-${entry.created_at}`} className="bg-white rounded-3xl shadow-xl p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-[#4b2d23]">{reading?.title || entry.post_id}</h3>
                          {reading?.scripture_ref && <p className="text-sm text-gray-500">{reading.scripture_ref}</p>}
                        </div>
                        <p className="text-sm text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</p>
                      </div>
                      {reading && <p className="text-gray-700 mt-4 whitespace-pre-wrap">{reading.reading_text}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            {favoriteItems.length === 0 ? (
              <div className="bg-[#5a211f] rounded-3xl p-6 sm:p-8 text-white text-center">
                <p className="mb-4">You don't have any saved favorites yet.</p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-white text-[#4b2d23] px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
                >
                  Discover Readings
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {favoriteItems.map((quote) => (
                  <div key={quote.id} className="bg-white rounded-3xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-[#4b2d23] mb-2">{quote.title || quote.scripture_ref}</h3>
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{quote.reading_text}</p>
                    {quote.reflection && <p className="text-gray-600 italic">{quote.reflection}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'answers' && (
          <div>
            {myAnswers.length === 0 ? (
              <div className="bg-[#5a211f] rounded-3xl p-6 sm:p-8 text-white text-center">
                <p className="mb-4">You haven't answered any questions yet.</p>
                <button
                  onClick={() => router.push('/ask')}
                  className="bg-white text-[#4b2d23] px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
                >
                  Browse Questions
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {myAnswers.map(a => (
                  <div key={a.id} className="bg-white rounded-3xl shadow-xl p-6">
                    <p className="text-gray-600 text-sm mb-2">Answer to question ID: {a.question_id}</p>
                    <p className="text-gray-800 mb-4 line-clamp-3">{a.content}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
