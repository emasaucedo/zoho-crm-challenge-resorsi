import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN;
const redirectURL = process.env.REDIRECT_URL

let accessToken = '';
let tokenExpirationTime = 0;

// Function to refresh the Access Token
async function refreshAccessToken() {
  try {
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectURL,
        refresh_token: refreshToken
      }
    });

    accessToken = response.data.access_token;
    tokenExpirationTime = Date.now() + 3600 * 1000;
  } catch (error) {
    console.error('Error refreshing the Access Token:', error.response.data);
    throw error;
  }
}

// Middleware for verifying and refreshing the Access Token
async function tokenMiddleware(req, res, next) {
  
  if (Date.now() > tokenExpirationTime - 5 * 60 * 1000 || !accessToken) {
    try {
      await refreshAccessToken(); // Refresh the token if it has expired or is about to expire.
    } catch (error) {
      return res.status(500).json({ error: 'Access Token could not be refreshed' });
    }
  }

  req.accessToken = accessToken;
  next(); 
}

export default tokenMiddleware;
