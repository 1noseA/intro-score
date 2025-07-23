import { createServerClient } from './server'
import { createClient } from './client'
import { Database } from '@/types/supabase'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Server-side database operations
export class DatabaseServer {
  private supabase = createServerClient()

  async getUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error) throw error
    return user
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  }

  async getUserRecordings(userId: string) {
    const { data, error } = await this.supabase
      .from('recordings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getAIPersonas(includePresets = true) {
    let query = this.supabase.from('ai_personas').select('*')
    
    if (includePresets) {
      const user = await this.getUser()
      if (user) {
        query = query.or(`is_preset.eq.true,user_id.eq.${user.id}`)
      } else {
        query = query.eq('is_preset', true)
      }
    }
    
    const { data, error } = await query.order('is_preset', { ascending: false })
    if (error) throw error
    return data
  }
}

// Client-side database operations
export class DatabaseClient {
  private supabase = createClient()

  async signUp(email: string, password: string, displayName?: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    })
    
    if (error) throw error
    return data
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error) throw error
    return user
  }

  async createRecording(title: string) {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.supabase
      .from('recordings')
      .insert([{
        user_id: user.id,
        title,
        status: 'recording'
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateRecording(id: string, updates: TablesUpdate<'recordings'>) {
    const { data, error } = await this.supabase
      .from('recordings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getRecording(id: string) {
    const { data, error } = await this.supabase
      .from('recordings')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async getMyRecordings() {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.supabase
      .from('recordings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file)
    
    if (error) throw error
    return data
  }

  async getFileUrl(bucket: string, path: string) {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  }
}