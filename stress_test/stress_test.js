// Import K6 modules
import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from 'file:///C:/Users/Admin/Desktop/k6_project/config.js'; // Đường dẫn file config

export let options = {
  stages: [
    { duration: '1s', target: 1 },  // Tăng số lượng VUs lên 2000 trong 1 phút
    // { duration: '2m', target: 2000 },  // Giữ 2000 VUs trong 2 phút
    // { duration: '5m', target: 10000 }, // Tăng số lượng VUs lên 10000 trong 5 phút
    // { duration: '5m', target: 10000 }, // Giữ 10000 VUs trong 5 phút
    // { duration: '5m', target: 20000 }, // Tăng số lượng VUs lên 20000 trong 5 phút
    // { duration: '5m', target: 20000 }, // Giữ 20000 VUs trong 5 phút
    // { duration: '5m', target: 80000 }, // Tăng số lượng VUs lên 80000 trong 5 phút
    // { duration: '10m', target: 80000 },// Giữ 80000 VUs trong 10 phút
    // { duration: '2m', target: 0 }, 
  ],
};

// Lấy danh sách token và userId từ config.js
const TOKENS = config.accounts_prod.map(account => account.token);
const USER_IDS = config.accounts_prod.map(account => account.userId);

// API endpoints
const BASE_URL = config.baseUrl;
const PROFILE_ENDPOINT = `${BASE_URL}/api/v1/accounts`;
const REACT_ENDPOINT = `${BASE_URL}/api/v1/statuses`;  // Đây là endpoint chính để react
const COMMENT_ENDPOINT = `${BASE_URL}/api/v1/statuses`;
const TIMELINE_ENDPOINT = `${BASE_URL}/api/v1/timelines/home?feed_key&limit=3`;

export default function () {
  // Chọn ngẫu nhiên một token và userId
  const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
  const userId = USER_IDS[Math.floor(Math.random() * USER_IDS.length)];
  const headers = {
    Authorization: token,
    ...config.commonHeaders,
  };

  // Lấy danh sách bài viết từ API timeline để lấy id_post
  const timelineRes = http.get(TIMELINE_ENDPOINT, { headers });
  check(timelineRes, {
    'timeline status is 200': (r) => r.status === 200,
    'timeline response time is less than 2s': (r) => r.timings.duration < 2000,
  });

  let id_post;
  try {
    const timelineData = JSON.parse(timelineRes.body);
    if (timelineData && timelineData.length > 0) {
      id_post = timelineData[0].id;  // Chọn bài viết đầu tiên
    } else {
      console.log('No posts found in timeline response.');
      return;
    }
  } catch (e) {
    console.log('Error parsing timeline response:', e);
    return;
  }

  // Scenario 1: Truy cập trang cá nhân
  const profileRes = http.get(`${PROFILE_ENDPOINT}/${userId}`, { headers });
  check(profileRes, {
    'profile status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  });
  // console.log(`Profile Response: ${profileRes.body}`);
  console.log(`Profile Status: ${profileRes.status}`);
  if (profileRes.status === 200) {
    console.log('Profile request successful.');
  } else {
    console.log('Profile request failed.');
  }

  // Scenario 2: React post
  const reactRes = http.post(`${REACT_ENDPOINT}/${id_post}/favourite`, null, { headers });
  check(reactRes, {
    'react post status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  });

  // console.log(`React Post Body: { id_post: ${id_post} }`);
  // console.log(`React Response: ${reactRes.body}`);
  console.log(`React Post Status: ${reactRes.status}`);
  if (reactRes.status === 200) {
    console.log('React post successful.');
  } else {
    console.log('React post failed.');
  }
  // Scenario 3: Comment post
  const commentPayload = JSON.stringify({ comment: 'This is a test comment' });
  const commentRes = http.post(COMMENT_ENDPOINT, commentPayload, { headers });
  check(commentRes, {
    'comment post status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  });
  if (commentRes.status === 200) {
    console.log('Comment post successful.');
  } else {
    console.log('Comment post failed.');
  }
  // console.log(`Comment Post Body: ${commentPayload}`);
  // console.log(`Comment Response: ${commentRes.body}`);

  // Sleep để mô phỏng hành vi thực tế của người dùng
  sleep(1);
}
