const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder_key';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload base64 or buffer image to Supabase Storage bucket
 * Returns public URL or fallback string
 */
async function uploadToSupabaseStorage(bucketName, fileName, base64OrBuffer, contentType = 'image/png') {
  try {
    if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder')) {
      console.log('[Supabase Storage] Running in offline mode, returning mock asset URL.');
      return base64OrBuffer.startsWith('data:') ? base64OrBuffer : `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop`;
    }

    let fileBuffer;
    if (typeof base64OrBuffer === 'string' && base64OrBuffer.startsWith('data:')) {
      const base64Data = base64OrBuffer.split(';base64,').pop();
      fileBuffer = Buffer.from(base64Data, 'base64');
    } else if (Buffer.isBuffer(base64OrBuffer)) {
      fileBuffer = base64OrBuffer;
    } else {
      return base64OrBuffer; // Already URL
    }

    const filePath = `uploads/${Date.now()}_${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('[Supabase Storage Error]:', error.message);
      // Fallback: retain base64 image so user preview and saved product image works
      if (typeof base64OrBuffer === 'string' && base64OrBuffer.startsWith('data:')) {
        return base64OrBuffer;
      }
      return `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop`;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('[Supabase Storage Exception]:', err);
    if (typeof base64OrBuffer === 'string' && base64OrBuffer.startsWith('data:')) {
      return base64OrBuffer;
    }
    return `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop`;
  }
}

module.exports = {
  supabase,
  uploadToSupabaseStorage,
};
