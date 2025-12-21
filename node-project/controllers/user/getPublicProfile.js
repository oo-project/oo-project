const { db } = require('../../firebase');

const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // ✨ 修正：直接去 'landlord' 集合找
    // 因為這個 API 主要是給「查看房東資訊」用的
    let doc = await db.collection('landlord').doc(id).get();

    // 如果在 landlord 找不到，試試看 users (預防萬一)
    if (!doc.exists) {
       doc = await db.collection('users').doc(id).get();
    }

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: '找不到此用戶' });
    }

    const userData = doc.data();
    
    const publicData = {
      name: userData.name || '房東',
      avatar: userData.avatar || '',
      bio: userData.bio || '這位房東很害羞，還沒寫自我介紹。',
      role: 'landlord'
    };

    res.status(200).json({ success: true, data: publicData });
  } catch (error) {
    console.error('取得用戶資料失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = getPublicProfile;