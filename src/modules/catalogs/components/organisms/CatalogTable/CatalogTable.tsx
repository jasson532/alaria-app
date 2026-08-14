import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAppDispatch } from 'modules/shared/hooks/useAppDispatch';
import { createCatalogItem, updateCatalogItem, deleteCatalogItem } from 'modules/catalogs/store/catalogsSlice';
import { useConfirm } from 'modules/shared/hooks/useConfirm';
import ConfirmModal from 'modules/shared/components/molecules/ConfirmModal/ConfirmModal';
import type { CatalogItem } from 'modules/catalogs/types';
import './CatalogTable.scss';

interface CatalogTableProps {
  title: string;
  table: string;
  items: CatalogItem[];
}

const CatalogTable = ({ title, table, items }: CatalogTableProps) => {
  const dispatch = useAppDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const modal = useConfirm();

  const handleAdd = () => {
    setIsAdding(true);
    setEditId(null);
    setInputValue('');
  };

  const handleEdit = (item: CatalogItem) => {
    setEditId(item.id);
    setIsAdding(false);
    setInputValue(item.name);
  };

  const handleSave = () => {
    if (!inputValue.trim()) return;

    if (editId) {
      dispatch(updateCatalogItem({ table, id: editId, name: inputValue.trim() }));
      setEditId(null);
    } else {
      dispatch(createCatalogItem({ table, name: inputValue.trim() }));
      setIsAdding(false);
    }
    setInputValue('');
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditId(null);
    setInputValue('');
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: 'Eliminar registro',
      message: '¿Estás seguro de eliminar este registro?',
      confirmLabel: 'Eliminar',
      variant: 'danger',
      onConfirm: () => {
        dispatch(deleteCatalogItem({ table, id }));
        modal.close();
      },
    });
  };

  return (
    <div className="catalog-table">
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        variant={modal.variant}
        onConfirm={modal.onConfirm}
        onCancel={modal.close}
      />
      <div className="catalog-table__header">
        <h3 className="catalog-table__title">{title}</h3>
        <button className="catalog-table__add-btn" onClick={handleAdd}>
          <Plus size={16} />
          Agregar
        </button>
      </div>

      <div className="catalog-table__body">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th style={{ width: '100px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={2} className="catalog-table__empty">
                  No hay registros
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {editId === item.id ? (
                    <input
                      className="catalog-table__input"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      autoFocus
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td>
                  {editId === item.id ? (
                    <div className="catalog-table__actions">
                      <button className="catalog-table__save-btn" onClick={handleSave}>Guardar</button>
                      <button className="catalog-table__cancel-btn" onClick={handleCancel}>X</button>
                    </div>
                  ) : (
                    <div className="catalog-table__actions">
                      <button
                        className="catalog-table__action-btn catalog-table__action-btn--edit"
                        onClick={() => handleEdit(item)}
                        aria-label="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="catalog-table__action-btn catalog-table__action-btn--delete"
                        onClick={() => handleDelete(item.id)}
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isAdding && (
          <div className="catalog-table__input-row">
            <input
              className="catalog-table__input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Nombre del registro"
              autoFocus
            />
            <button className="catalog-table__save-btn" onClick={handleSave}>Guardar</button>
            <button className="catalog-table__cancel-btn" onClick={handleCancel}>Cancelar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogTable;
