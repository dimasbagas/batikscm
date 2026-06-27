import axios from 'axios'

async function debug() {
  try {
    console.log('Logging in...')
    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'umkm@batikchain.id',
      password: 'admin123'
    })
    const token = loginRes.data.accessToken
    console.log('Login success. Token:', token.substring(0, 15) + '...')

    console.log('Registering product...')
    // Replicating form payload from frontend
    const payload = {
      productName: 'Batik Tulis debug',
      producerName: 'UKM Tenun Riau',
      originLocation: 'Pekanbaru, Riau',
      productionDate: '2023-08-15',
      imageUrl: 'http://localhost:3000/api/v1/products/image/products/debug.png'
    }

    const res = await axios.post('http://localhost:3000/api/v1/products', payload, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('Success:', res.data)
  } catch (error: any) {
    if (error.response) {
      console.log('STATUS:', error.response.status)
      console.log('ERROR DATA:', JSON.stringify(error.response.data, null, 2))
    } else {
      console.log('Error message:', error.message)
    }
  }
}

debug()
