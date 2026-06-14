import SparkMD5 from 'spark-md5';

/**
 * Calculates the MD5 hash of a file and returns it as a Base64 string.
 * This is useful for Content-MD5 headers in cloud storage uploads.
 */
export async function calculateFileMd5(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunkSize = 2097152; // 2MB chunks
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        spark.append(e.target.result);
        currentChunk++;

        if (currentChunk < chunks) {
          loadNext();
        } else {
          // Get binary hash as string then convert to base64
          const rawHash = spark.end(true); // true means raw binary
          const base64 = btoa(rawHash);
          resolve(base64);
        }
      }
    };

    fileReader.onerror = () => {
      reject(new Error("Ошибка при чтении файла для расчета MD5."));
    };

    function loadNext() {
      const start = currentChunk * chunkSize;
      const end =
        start + chunkSize >= file.size ? file.size : start + chunkSize;
      fileReader.readAsArrayBuffer(file.slice(start, end));
    }

    loadNext();
  });
}
