import SparkMD5 from 'spark-md5';

/**
 * Calculates the Base64-encoded MD5 hash of a Blob, File, ArrayBuffer or string (as required by S3 Content-MD5 header).
 */
export async function calculateContentMd5Base64(content: Blob | File | string | ArrayBuffer): Promise<string> {
  let arrayBuffer: ArrayBuffer;

  if (typeof content === 'string') {
    arrayBuffer = new TextEncoder().encode(content).buffer as ArrayBuffer;
  } else if (content instanceof ArrayBuffer) {
    arrayBuffer = content;
  } else {
    arrayBuffer = await content.arrayBuffer();
  }

  const spark = new SparkMD5.ArrayBuffer();
  spark.append(arrayBuffer);
  const hexHash = spark.end();

  const bytes = new Uint8Array(
    hexHash.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
