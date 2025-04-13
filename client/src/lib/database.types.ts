export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          price: number
          stock: number
          alert_threshold: number
          images: string[]
          usage_type: 'venta' | 'sesión 1-a-1' | 'empresarial'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['products']['Row'], 'id'>>
      }
      orders: {
        Row: {
          id: string
          consecutive: number
          date: string
          customer_name: string
          total: number
          status: 'pending' | 'completed'
          type: 'order' | 'sale'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'consecutive' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'consecutive'>>
      }
      order_products: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['order_products']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['order_products']['Row'], 'id'>>
      }
    }
  }
}