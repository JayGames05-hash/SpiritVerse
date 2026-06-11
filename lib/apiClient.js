const jsonHeaders = { 'Content-Type': 'application/json' }
const authListeners = new Set()

function emitAuthEvent(event, session) {
  authListeners.forEach((listener) => {
    try {
      listener.callback(event, session)
    } catch (error) {
      console.error('auth event failed', error)
    }
  })
}

async function request(path, options = {}) {
  try {
    const response = await fetch(path, {
      credentials: 'include',
      ...options,
      headers: {
        ...jsonHeaders,
        ...(options.headers || {}),
      },
    })

    const body = await response.json().catch(() => null)
    if (!response.ok) {
      return { data: null, error: { message: body?.error || response.statusText } }
    }

    return { data: body, error: null }
  } catch (error) {
    return { data: null, error: { message: error.message || 'Network error' } }
  }
}

const auth = {
  getUser: async () => {
    const { data, error } = await request('/api/auth/user', { method: 'GET' })
    if (error) return { data: { user: null }, error }
    return { data: { user: data.user }, error: null }
  },
  signUp: async ({ email, password }, { options } = {}) => {
    const saintName = options?.data?.saint_name || ''
    const { data, error } = await request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, saint_name: saintName }),
    })
    if (!error) {
      emitAuthEvent('SIGNED_IN', { user: data.user })
    }
    return { data: { user: data?.user ?? null }, error }
  },
  signInWithPassword: async ({ email, password }) => {
    const { data, error } = await request('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (!error) {
      emitAuthEvent('SIGNED_IN', { user: data.user })
    }
    return { data: { user: data?.user ?? null }, error }
  },
  signOut: async () => {
    const { data, error } = await request('/api/auth/signout', { method: 'POST' })
    if (!error) {
      emitAuthEvent('SIGNED_OUT', { user: null })
    }
    return { data, error }
  },
  onAuthStateChange: (callback) => {
    const listener = { callback }
    authListeners.add(listener)
    return {
      data: {
        subscription: {
          unsubscribe() {
            authListeners.delete(listener)
          },
        },
      },
    }
  },
}

export async function getComments(postId) {
  const { data, error } = await request(`/api/comments?post_id=${encodeURIComponent(postId)}`, { method: 'GET' })
  return { data: data?.comments ?? [], error }
}

export async function createComment(postId, text, authorName) {
  const { data, error } = await request('/api/comments', {
    method: 'POST',
    body: JSON.stringify({ post_id: postId, text, author_name: authorName }),
  })
  return { data: data?.comment ?? null, error }
}

export async function updateComment(id, values) {
  const { data, error } = await request(`/api/comments/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(values),
  })
  return { data: data?.comment ?? null, error }
}

export async function deleteComment(id) {
  const { data, error } = await request(`/api/comments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  return { data, error }
}

export async function getReactions(postId) {
  const { data, error } = await request(`/api/reactions?post_id=${encodeURIComponent(postId)}`, { method: 'GET' })
  return {
    data: {
      count: data?.count ?? 0,
      liked: data?.liked ?? false,
      reactions: data?.reactions ?? [],
    },
    error,
  }
}

export async function addReaction(postId) {
  const { data, error } = await request('/api/reactions', {
    method: 'POST',
    body: JSON.stringify({ post_id: postId, type: 'like' }),
  })
  return { data: data?.reaction ?? null, error }
}

export async function removeReaction(postId) {
  const { data, error } = await request('/api/reactions', {
    method: 'DELETE',
    body: JSON.stringify({ post_id: postId }),
  })
  return { data, error }
}

export async function getAdminComments() {
  const { data, error } = await request('/api/comments', { method: 'GET' })
  return { data: data?.comments ?? [], error }
}

export async function updateCommentStatus(id, status) {
  const { data, error } = await request(`/api/comments/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
  return { data: data?.comment ?? null, error }
}

export { auth }
