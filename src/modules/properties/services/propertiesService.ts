import { supabase } from 'modules/shared/services/supabase';
import type { PropertyWithRelations, PropertyFormData, PropertyFilters } from '../types';

const PROPERTY_SELECT = `
  *,
  house_localities(name),
  house_strata(level, name),
  house_property_types(name),
  house_transaction_types(name),
  house_property_states(name),
  house_property_media(*)
`;

export const propertiesService = {
  async getAll(filters?: PropertyFilters, includePending: boolean = false): Promise<PropertyWithRelations[]> {
    let query = supabase
      .from('house_properties')
      .select(PROPERTY_SELECT)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Excluir inmuebles en estado Pendiente para usuarios públicos
    if (!includePending) {
      const { data: pendingState } = await supabase
        .from('house_property_states')
        .select('id')
        .eq('name', 'Pendiente')
        .single();
      if (pendingState) {
        query = query.neq('state_id', pendingState.id);
      }
    }

    if (filters?.transaction_type_id) {
      query = query.eq('transaction_type_id', filters.transaction_type_id);
    }
    if (filters?.property_type_id) {
      query = query.eq('property_type_id', filters.property_type_id);
    }
    if (filters?.locality_id) {
      query = query.eq('locality_id', filters.locality_id);
    }
    if (filters?.stratum_id) {
      query = query.eq('stratum_id', filters.stratum_id);
    }
    if (filters?.min_price) {
      query = query.gte('price', filters.min_price);
    }
    if (filters?.max_price) {
      query = query.lte('price', filters.max_price);
    }
    if (filters?.bedrooms) {
      query = query.gte('bedrooms', filters.bedrooms);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<PropertyWithRelations | null> {
    const { data, error } = await supabase
      .from('house_properties')
      .select(PROPERTY_SELECT)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(property: PropertyFormData, createdBy: string): Promise<PropertyWithRelations> {
    const { data, error } = await supabase
      .from('house_properties')
      .insert({ ...property, created_by: createdBy, is_active: true })
      .select(PROPERTY_SELECT)
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, property: Partial<PropertyFormData>): Promise<PropertyWithRelations> {
    const { data, error } = await supabase
      .from('house_properties')
      .update(property)
      .eq('id', id)
      .select(PROPERTY_SELECT)
      .single();
    if (error) throw error;
    return data;
  },

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('house_properties')
      .update({ is_active: isActive })
      .eq('id', id);
    if (error) throw error;
  },

  async uploadMedia(propertyId: string, file: File, isCover: boolean = false): Promise<string> {
    const ext = file.name.split('.').pop();
    const fileName = `${propertyId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('property-media')
      .upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('property-media')
      .getPublicUrl(fileName);

    const fileType = file.type.startsWith('video/') ? 'video' : 'photo';

    const { error: insertError } = await supabase
      .from('house_property_media')
      .insert({
        property_id: propertyId,
        file_url: publicUrl,
        file_type: fileType,
        file_name: file.name,
        file_size: file.size,
        is_cover: isCover,
      });
    if (insertError) throw insertError;

    return publicUrl;
  },

  async deleteMedia(mediaId: string): Promise<void> {
    const { error } = await supabase
      .from('house_property_media')
      .delete()
      .eq('id', mediaId);
    if (error) throw error;
  },
};
