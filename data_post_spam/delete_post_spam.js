import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 1, // Số lượng virtual users
  duration: '100s', // Thời gian chạy
};

const BASE_URL = 'https://prod-sn.emso.vn/api/v1';
const USERS = [
  { token: 'Bearer RywajiSwzcSA2cgQElYjOktuvBt2duWDPQqBomK5cMo', userId: '109307596693229606' },
  { token: 'Bearer hgKONHVF209Sx67tz4EfZwnLNVyXXh_u-sVrC3veKQ8', userId: '108813322749055123' },
  { token: 'Bearer nfJgN2jv9ITtFEqYJm8ONe1PkoFi9as_qR6a95Yh-3M', userId: '112788029333391350' },
];

// Header chung
const HEADERS = {
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'vi,vi-VN;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5,de;q=0.4,ja;q=0.3',
  'cache-control': 'no-cache',
  'origin': 'https://prod-fe.emso.vn',
  'referer': 'https://prod-fe.emso.vn/',
  'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
};

export default function () {
  USERS.forEach((user) => {
    const GET_ENDPOINT = `${BASE_URL}/accounts/${user.userId}/statuses?feed_key=355130&exclude_replies=true&limit=3`;

    // Gửi yêu cầu GET để lấy danh sách bài viết của từng user
    let res = http.get(GET_ENDPOINT, { headers: { ...HEADERS, 'Authorization': user.token } });

    // Kiểm tra phản hồi GET
    check(res, {
      'GET status is 200': (r) => r.status === 200,
    });

    if (res.status === 200) {
      console.log(`Phản hồi GET thành công cho user ${user.userId}: ${res.body}`);
      
      try {
        let posts = JSON.parse(res.body);

        posts.forEach((post) => {
          console.log(`ID bài viết: ${post.id}, Nội dung: ${post.content}`);
          
          // Kiểm tra nội dung bài viết và nếu nội dung là "This is a load testing post content.", xóa bài viết
          if (post.content === 'This is a load testing post content.') {
            const postId = post.id;
            console.log(`Đang xóa bài post với ID: ${postId} của user ${user.userId}`);

            // Endpoint để xóa bài viết
            const DELETE_ENDPOINT = `${BASE_URL}/statuses/${postId}`;
            let deleteRes = http.del(DELETE_ENDPOINT, null, { headers: { ...HEADERS, 'Authorization': user.token } });

            // Kiểm tra phản hồi DELETE
            check(deleteRes, {
              'DELETE status is 200 or 204': (r) => r.status === 200 || r.status === 204,
            });

            if (deleteRes.status === 200 || deleteRes.status === 204) {
              console.log(`Đã xóa bài post với ID: ${postId} của user ${user.userId}`);
            } else {
              console.error(`Lỗi khi xóa bài post với ID: ${postId} của user ${user.userId}, Error: ${deleteRes.status}`);
              console.error(`Thông tin phản hồi xóa: ${deleteRes.body}`);
            }
          }
        });
      } catch (error) {
        console.error(`Lỗi khi parse response JSON cho user ${user.userId}:`, error);
      }
    } else {
      console.error(`Lỗi khi gọi API GET cho user ${user.userId}: ${res.status}, Phản hồi: ${res.body}`);
    }
  });

  sleep(1); // Nghỉ giữa các yêu cầu
}
