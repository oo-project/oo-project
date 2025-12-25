const express = require('express');
const cors = require('cors');
// 引入 firebase 設定 (若其他 API 需要 db，可以 const { db } = require('./firebaseConfig');)
const { db } = require('./firebaseConfig');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const contractRoutes = require('./routes/contracts');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api', authRoutes);
app.use('/api', contractRoutes);
app.use('/api', userRoutes);


app.get('/api/room-tenants', async (req, res) => {
  try {
    const { rentalId } = req.query;

    if (!rentalId) return res.json([]);

    const snapshot = await db.collection('appointments')
      .where('rentalId', '==', rentalId)
      .get();

    if (snapshot.empty) {
      return res.json([]); 
    }

    const tenants = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.tenantId,
        name: data.tenantName,
        status: data.status || 'applied'
      };
    });

    res.json(tenants);
  } catch (error) {
    console.error("讀取房客失敗:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});