import http from 'k6/http';
import { check, sleep } from 'k6';

// ⚠️ Mở file video ở phạm vi toàn cục (init stage)
const videoFilePath = 'C:/Users/Admin/Desktop/k6_project/353775516_922847442117750_5591380169403242164_n.mp4';
const videoFile = open(videoFilePath, 'b'); // 'b' để mở file nhị phân (binary)

export const options = {
  vus: 1, // Số lượng người dùng ảo
  duration: '1s', // Thời gian thực hiện kiểm thử
};

export default function () {
  // 1️⃣ **API tải video**
  const uploadUrl = 'https://pt.emso.vn/api/v1/videos/upload';
  const uploadHeaders = {
    'Authorization': 'Bearer 6ac44cc57393fab85e585c961b54ecf89fcece44',
    'Accept': 'application/json, text/plain, */*',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };

  // 🟢 Tạo form-data
  const uploadFormData = {
    videofile: http.file(videoFile, '353775516_922847442117750_5591380169403242164_n.mp4', 'video/mp4'), 
    name: '353775516_922847442117750_5591380169403242164_n.mp4',
    token: 'RywajiSwzcSA2cgQElYjOktuvBt2duWDPQqBomK5cMo', // Token (nếu cần)
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
  const postUrl = 'https://cmc-sn.emso.vn/api/v1/statuses';
  const postHeaders = {
    'Authorization': 'Bearer RywajiSwzcSA2cgQElYjOktuvBt2duWDPQqBomK5cMo',
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
    'is post created successfully': (r) => r.body.includes('media_ids'),
  });
}
