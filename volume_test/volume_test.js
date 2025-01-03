import http from 'k6/http';
import { check, sleep } from 'k6';

// ⚠️ Mở file video ở phạm vi toàn cục (init stage)
const videoFilePath = 'C:/Users/Admin/Desktop/k6_project/353775516_922847442117750_5591380169403242164_n.mp4';
const videoFile = open(videoFilePath, 'b'); // 'b' để mở file nhị phân (binary)

export const options = {
  stages: [
    { duration: '5m', target: 1000 }, // Tăng tải lên 1,000 video trong 5 phút
    { duration: '5m', target: 1000 }, // Giữ ổn định ở mức 1,000 video trong 5 phút
    { duration: '5m', target: 5000 }, // Tăng tải lên 5,000 video trong 5 phút
    { duration: '5m', target: 5000 }, // Giữ ổn định ở mức 5,000 video trong 5 phút
    { duration: '5m', target: 10000 }, // Tăng tải lên 10,000 video trong 5 phút
    { duration: '10m', target: 10000 }, // Giữ ổn định ở mức 10,000 video trong 10 phút
    { duration: '5m', target: 0 }, // Giảm về 0 trong 5 phút
  ],
};

export default function () {
  // 1️⃣ **API tải video**
  const uploadUrl = 'https://prod-pt.emso.vn/api/v1/videos/upload';
  const uploadHeaders = {
    'Authorization': 'Bearer 6be43e024fb7133b2fbbbd0e0ccd77873513e899',
    'Accept': 'application/json, text/plain, */*',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };

  // 🟢 Tạo form-data
  const uploadFormData = {
    videofile: http.file(videoFile, '353775516_922847442117750_5591380169403242164_n.mp4', 'video/mp4'), 
    name: '353775516_922847442117750_5591380169403242164_n.mp4',
    token: 'e9ICJkW6mNdJE3rUB9H-1NvCuR9NwuRcDyvYRsyQY08', // Token (nếu cần)
    channelId: '2', 
    privacy: '1', 
    mimeType: 'video/mp4', 
    position: '1', 
  };

  // 🔥 Gửi yêu cầu POST tải video
  const uploadResponse = http.post(uploadUrl, uploadFormData, { headers: uploadHeaders });

  // 🟡 Ghi lại phản hồi từ API
  console.log('Response status (upload): ' + uploadResponse.status);
  console.log('Response body (upload): ' + uploadResponse.body);

  // 🔍 Lấy media_id từ phản hồi
  let media_id;
  try {
    const responseBody = JSON.parse(uploadResponse.body);
    media_id = responseBody?.id; // ⚠️ Sửa từ media_id thành id
  } catch (error) {
    console.error('❌ Lỗi phân tích JSON từ phản hồi:', error);
  }

  if (!media_id) {
    console.error('❌ Không lấy được media_id, dừng kiểm thử!');
    return;
  }

  console.log(`✅ Media ID nhận được: ${media_id}`);

  // 2️⃣ **API đăng bài viết**
  const postUrl = 'https://prod-sn.emso.vn/api/v1/statuses';
  const postHeaders = {
    'Authorization': 'Bearer e9ICJkW6mNdJE3rUB9H-1NvCuR9NwuRcDyvYRsyQY08',
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  };

  const postPayload = JSON.stringify({
    id: null,
    media_ids: [media_id],
    sensitive: false,
    visibility: 'public',
    extra_body: {},
    status: 'Bài viết này được tạo từ K6 🚀',
  });

  // 🔥 Gửi yêu cầu POST bài viết
  const postResponse = http.post(postUrl, postPayload, { headers: postHeaders });

  // 🟡 Ghi lại phản hồi từ API
  console.log('Response status (post): ' + postResponse.status);
  console.log('Response body (post): ' + postResponse.body);

  // 🔍 Kiểm tra phản hồi đăng bài
  check(postResponse, {
    'is status 200 or 201': (r) => r.status === 200 || r.status === 201,
    // 'is post created successfully': (r) => r.body.includes('media_ids'),
  });
}
