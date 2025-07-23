import { createServerClient } from './server'
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