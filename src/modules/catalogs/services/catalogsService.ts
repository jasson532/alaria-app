import { supabase } from 'modules/shared/services/supabase';
import type { CatalogItem } from '../types';

export const catalogsService = {
  async getAll(table: string): Promise<CatalogItem[]> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async create(table: string, name: string): Promise<CatalogItem> {
    const { data, error } = await supabase
      .from(table)
      .insert({ name })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(table: string, id: string, name: string): Promise<CatalogItem> {
    const { data, error } = await supabase
      .from(table)
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(table: string, id: string): Promise<void> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
