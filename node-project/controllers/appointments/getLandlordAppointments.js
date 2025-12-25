const { db } = require('../../firebaseConfig');

const getLandlordAppointments = async (req, res) => {
  try {
    const { id } = req.params; // 房東 ID
    const snapshot = await db.collection('appointments')
      .where('landlordId', '==', id)
      //.orderBy('createdAt', 'desc')
      .get();

    const data = [];
    snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = getLandlordAppointments;