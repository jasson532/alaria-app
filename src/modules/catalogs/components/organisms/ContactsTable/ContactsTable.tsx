import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Phone } from 'lucide-react';
import { supabase } from 'modules/shared/services/supabase';
import { useConfirm } from 'modules/shared/hooks/useConfirm';
import ConfirmModal from 'modules/shared/components/molecules/ConfirmModal/ConfirmModal';
import type { ContactItem } from 'modules/catalogs/types';
import './ContactsTable.scss';

const ContactsTable = () => {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: '', phone: '', email: '' });
  const modal = useConfirm();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const { data } = await supabase.from('house_contacts').select('*').order('full_name');
    setContacts(data || []);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditId(null);
    setForm({ full_name: '', phone: '', email: '' });
  };

  const handleEdit = (contact: ContactItem) => {
    setEditId(contact.id);
    setIsAdding(false);
    setForm({ full_name: contact.full_name, phone: contact.phone, email: contact.email || '' });
  };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.phone.trim()) return;

    if (editId) {
      await supabase.from('house_contacts').update({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
      }).eq('id', editId);
    } else {
      await supabase.from('house_contacts').insert({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
      });
    }

    setIsAdding(false);
    setEditId(null);
    setForm({ full_name: '', phone: '', email: '' });
    loadContacts();
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditId(null);
    setForm({ full_name: '', phone: '', email: '' });
  };

  const handleDelete = async (id: string) => {
    modal.confirm({
      title: 'Eliminar contacto',
      message: '¿Estás seguro de eliminar este contacto?',
      confirmLabel: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        await supabase.from('house_contacts').delete().eq('id', id);
        loadContacts();
        modal.close();
      },
    });
  };

  return (
    <div className="contacts-table">
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        variant={modal.variant}
        onConfirm={modal.onConfirm}
        onCancel={modal.close}
      />
      <div className="contacts-table__header">
        <h3 className="contacts-table__title">Contactos</h3>
        <button className="contacts-table__add-btn" onClick={handleAdd}>
          <Plus size={16} />
          Agregar
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th style={{ width: '100px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 && (
            <tr><td colSpan={4} className="contacts-table__empty">No hay contactos</td></tr>
          )}
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.full_name}</td>
              <td>
                <span className="contacts-table__phone">
                  <Phone size={14} />
                  {contact.phone}
                </span>
              </td>
              <td>{contact.email || '-'}</td>
              <td>
                <div className="contacts-table__actions">
                  <button className="contacts-table__action-btn contacts-table__action-btn--edit" onClick={() => handleEdit(contact)} aria-label="Editar">
                    <Pencil size={16} />
                  </button>
                  <button className="contacts-table__action-btn contacts-table__action-btn--delete" onClick={() => handleDelete(contact.id)} aria-label="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(isAdding || editId) && (
        <div className="contacts-table__form">
          <input placeholder="Nombre completo *" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <input placeholder="Celular *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Email (opcional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="contacts-table__form-actions">
            <button className="contacts-table__save-btn" onClick={handleSave}>Guardar</button>
            <button className="contacts-table__cancel-btn" onClick={handleCancel}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsTable;
