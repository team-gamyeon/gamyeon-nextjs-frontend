async function uploadFileToS3(file: File, presignedUrl: string) {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })
  if (response.ok) {
    return {
      success: true,
      message: 'S3 업로드 성공했습니다.',
    }
  } else {
    return {
      success: false,
      message: 'S3 업로드 실패했습니다.',
    }
  }
}
export default uploadFileToS3
