import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { MOCK_RESTAURANTS, MOCK_MENUS } from './mockData';

export async function seedFirestore() {
  try {
    const colRef = collection(db, 'restaurants');
    const snap = await getDocs(colRef);
    
    if (snap.empty) {
      console.log('Seeding Firestore with mock restaurants and menus...');
      for (const restaurant of MOCK_RESTAURANTS) {
        // Write restaurant doc
        await setDoc(doc(db, 'restaurants', restaurant.id), restaurant);
        
        // Write menu items subcollection
        const menuItems = MOCK_MENUS[restaurant.id] || [];
        for (const item of menuItems) {
          await setDoc(doc(db, 'menus', restaurant.id, 'items', item.id), item);
        }
      }
      console.log('Database seeded successfully!');
    } else {
      console.log('Database already has content. Skipping seed.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}
