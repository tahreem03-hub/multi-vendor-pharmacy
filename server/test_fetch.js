import http from 'http';

http.get('http://localhost:4000/uploads/media/1779126143665-710743724.png', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  res.on('data', (d) => {});
}).on('error', (e) => {
  console.error('Error fetching image:', e.message);
});
