

import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();


export async function getDataInstagramPosting() {

    const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN!;
    const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID!;
  

  
    try {
      const response = await axios.get(
        `https://graph.instagram.com/me/media?${INSTAGRAM_USER_ID}/media`,
        {
          params: {
            fields: 'id,caption,media_type,media_url,permalink',
            access_token: ACCESS_TOKEN,
          },
        }
      );
  
      
      return response.data;

    } catch (error: any) {
      console.error('Error fetching Instagram media:', error.response?.data || error.message);
    }
  }

  export async function getDataInstagramProfile() {

    const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN!;
    const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID!;
  
    console.log("acces token now : ",  process.env.INSTAGRAM_ACCESS_TOKEN)
  
    try {
      const response = await axios.get(
        `https://graph.instagram.com/me?${INSTAGRAM_USER_ID}/media`,
        {
          params: {
            fields: 'id,username,media_count,followers_count,follows_count,biography,website,profile_picture_url',
            access_token: ACCESS_TOKEN,
          },
        }
      );
  
      
      return response.data;

    } catch (error: any) {
      console.error('Error fetching Instagram media:', error.response?.data || error.message);
    }
  }