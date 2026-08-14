import { supabase } from 'modules/shared/services/supabase';

export const favoritesService = {
  async isFavorite(propertyId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('house_favorites')
      .select('id')
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .single();
    return Boolean(data);
  },

  async toggle(propertyId: string, userId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('house_favorites')
      .select('id')
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase.from('house_favorites').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('house_favorites').insert({ property_id: propertyId, user_id: userId });
      return true;
    }
  },

  async getUserFavorites(userId: string): Promise<string[]> {
    const { data } = await supabase
      .from('house_favorites')
      .select('property_id')
      .eq('user_id', userId);
    return data?.map((f) => f.property_id) || [];
  },
};
