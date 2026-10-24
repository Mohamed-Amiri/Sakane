// Temporary: HEAD-check every seed/static image URL for 404s.
const seedIds = [
  '1564013799919-ab600027ffc6', '1600596542815-ffad4c1539a9', '1600585154340-be6161a56a0c',
  '1502672260266-1c1ef2d93688', '1560448204-e02f11c3d0e2', '1539020140153-e479b8c22e70',
  '1553830591-d8632a99e6ff', '1536376072261-38c75010e6c9', '1586023492125-27b2c045efd7',
  '1493809842364-78817add7ffb', '1507089947368-19c1da9775ae', '1499793983690-e29da59ef1c2',
  '1512917774080-9991f1c4c750', '1522708323590-d24dbb6b0267', '1611892440504-42a792e24d32',
  '1519167758481-83f550bb49b3', '1497366216548-37526070297c', '1489749798305-4fea3ae63d43',
  '1600607687939-ce8a6c25118c', '1600566753190-17f0baa2a6c3', '1600585154526-990dced4db0d',
  // static (hero, cat tiles, auth-side)
  '1613490493576-7fde63acd811', '1505691938895-1758d7feb511', '1497366754035-f200968a6e72',
  '1521783988139-89397d761dce'
];

(async () => {
  for (const id of seedIds) {
    const url = `https://images.unsplash.com/photo-${id}?q=80&w=400`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(res.status === 200 ? 'OK   ' : 'DEAD ', res.status, id);
    } catch (e) {
      console.log('ERR  ', e.message, id);
    }
  }
})();
