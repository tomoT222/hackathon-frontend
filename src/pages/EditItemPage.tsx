import { useParams, Link } from 'react-router-dom';
import { SellItemForm } from '../features/items/components/SellItemForm';
import { useItem } from '../features/items/api/useItems';
import { useAuth } from '../features/auth/api/useAuth';

export const EditItemPage = () => {
    const { id } = useParams<{ id: string }>();
    // @ts-ignore
    const { item, isLoading, error } = useItem(id);
    const { user } = useAuth();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading item</div>;
    if (!item) return <div>Item not found</div>;
    
    // Auth Check
    if (user?.uid !== item.user_id) {
        return <div>権限がありません</div>;
    }

    return (
        <div style={{ padding: '24px' }}>
            <Link to={`/items/${id}`} style={{ display: 'inline-block', marginBottom: '24px', color: '#666', textDecoration: 'none' }}>
                ← 商品詳細に戻る
            </Link>
            <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>商品情報の編集</h1>
            <SellItemForm initialData={item} />
        </div>
    );
};
