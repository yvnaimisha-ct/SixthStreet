import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const ENV = process.env.CONTENTFUL_ENV || 'development';
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;
// const CDA_TOKEN = process.env.CONTENTFUL_CDA_TOKEN!;
const CONTENT_TYPE = process.env.CONTENTFUL_CONTENT_TYPE!;

// Debug log to verify environment variables are loaded
console.log('SPACE_ID:', SPACE_ID ? SPACE_ID : 'NOT SET');
console.log('ENV:', ENV);
console.log('MANAGEMENT_TOKEN:', MANAGEMENT_TOKEN ? MANAGEMENT_TOKEN : 'NOT SET');
// console.log('CDA_TOKEN:', CDA_TOKEN ? CDA_TOKEN : 'NOT SET');
// console.log('CONTENT_TYPE:', CONTENT_TYPE || 'NOT SET');

const BASE_URL = `https://api.contentful.com/spaces/${SPACE_ID}/environments/${ENV}`;

// const BASE_URL = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/${ENV}`;

export async function getContentType(contentTypeId: string) {
  console.log('Fetching content type:', contentTypeId);
  console.log('Request URL:', `${BASE_URL}/content_types/${contentTypeId}`);
  const res = await axios.get(
    `${BASE_URL}/content_types/${contentTypeId}`,
    {
      headers: {
        // Authorization: `Bearer ${CDA_TOKEN}`,
        // 'Content-Type': 'application/vnd.contentful.management.v1+json',
        'Authorization': `Bearer ${MANAGEMENT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  // Transform the Management API response to match the expected format
  const contentType = res.data;
  return {
    id: contentType.sys.id,
    name: contentType.name,
    displayField: contentType.displayField,
    description: contentType.description,
    fields: contentType.fields,
    sys: contentType.sys
  };
}
