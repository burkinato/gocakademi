// Test Auth Endpoints
const BASE_URL = 'http://localhost:3001';

async function testRegister() {
    console.log('\n🧪 Testing REGISTER...');
    try {
        const response = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'testuser@example.com',
                password: 'test123',
                firstName: 'Test',
                lastName: 'User'
            })
        });
        const data = await response.json();
        console.log('✅ Register:', data);
        return data;
    } catch (error) {
        console.error('❌ Register failed:', error);
    }
}

async function testLogin() {
    console.log('\n🧪 Testing LOGIN...');
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'testuser@example.com',
                password: 'test123'
            })
        });
        const data = await response.json();
        console.log('✅ Login:', data);
        return data;
    } catch (error) {
        console.error('❌ Login failed:', error);
    }
}

async function testMe(token) {
    console.log('\n🧪 Testing /ME...');
    try {
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        console.log('✅ Me:', data);
        return data;
    } catch (error) {
        console.error('❌ Me failed:', error);
    }
}

async function runTests() {
    console.log('🚀 Starting Auth Tests...\n');

    // Test register
    const registerResult = await testRegister();

    // Test login
    const loginResult = await testLogin();

    // Test /me with token
    if (loginResult?.data?.accessToken) {
        await testMe(loginResult.data.accessToken);
    }

    console.log('\n✅ All tests completed!');
}

runTests();
