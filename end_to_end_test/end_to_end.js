import http from 'k6/http';
import { check, sleep } from 'k6';

// Các tham số thiết lập
export let options = {
    stages: [
        { duration: '5m', target: 100000}, // Tăng tải từ 0 lên 100,000 users trong 5 phút
        { duration: '10m', target: 100000 }, // Giữ tải ở 100,000 users trong 10 phút
        { duration: '5m', target: 0 }, // Giảm tải về 0 trong 5 phút
    ],
    thresholds: {
        'http_req_duration': ['p(95)<1000'], // 95% các request phải có thời gian đáp ứng dưới 1 giây
    },
};

// Danh sách token để sử dụng ngẫu nhiên
const tokens = [
    'Bearer RywajiSwzcSA2cgQElYjOktuvBt2duWDPQqBomK5cMo',
    'Bearer hgKONHVF209Sx67tz4EfZwnLNVyXXh_u-sVrC3veKQ8',
    'Bearer nfJgN2jv9ITtFEqYJm8ONe1PkoFi9as_qR6a95Yh-3M',
];

// Hàm chọn ngẫu nhiên token và tạo headers chung
function getHeaders() {
    return {
        'Authorization': tokens[Math.floor(Math.random() * tokens.length)],
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
    };
}

// Hàm chung để gửi POST request
function postRequest(url, data) {
    return http.post(url, JSON.stringify(data), { headers: getHeaders() });
}

// Hàm chung để gửi GET request
function getRequest(url) {
    return http.get(url, { headers: getHeaders() });
}

// Các API endpoint
const baseURL = 'https://lab-sn.emso.vn/api/v1';

export default function () {
    // 70% user đọc dữ liệu (timeline)
    if (Math.random() < 0.7) {
        let res = getRequest(`${baseURL}/timelines/home`);
        check(res, {
            'Status is 200 for timeline': (r) => r.status === 200,
            'response time < 1000ms': (r) => r.timings.duration < 1000,
        }) || console.error(`Timeline request failed. Status: ${res.status}, Body: ${res.body}`);

        // Lấy ID của post ngẫu nhiên từ kết quả
        let responseData = JSON.parse(res.body);
        if (responseData && responseData.length > 0) {
            const randomPost = responseData[Math.floor(Math.random() * responseData.length)];
            const postId = randomPost && randomPost.id;

            // 20% user tương tác (like + comment)
            if (Math.random() < 0.2857) { // 20% của tổng (20/70 = ~28.57%)
                if (postId) {
                    let reactRes = postRequest(`${baseURL}/statuses/${postId}/favourite`, { "custom_vote_type": "like" });
                    check(reactRes, {
                        'Status is 200 for react (like)': (r) => r.status === 200,
                        'response time < 1000ms': (r) => r.timings.duration < 1000,
                    }) || console.error(`React request failed. Status: ${reactRes.status}, Body: ${reactRes.body}`);
                }

                // Comment bài viết
                if (postId) {
                    let commentData = {
                        id: Math.random().toString(),
                        status: 'test cmt k6',
                        in_reply_to_id: postId,
                        sensitive: false,
                        visibility: 'public',
                    };
                    let commentRes = postRequest(`${baseURL}/statuses`, commentData);
                    check(commentRes, {
                        'Status is 200 for comment': (r) => r.status === 200,
                        'response time < 1000ms': (r) => r.timings.duration < 1000,
                    }) || console.error(`Comment request failed. Status: ${commentRes.status}, Body: ${commentRes.body}`);
                }
            }
        }
    } 
    
    // 10% user tạo bài viết (post mới)
    else if (Math.random() < 0.1) {
        const postData = {
            status: 'post k6',
            visibility: 'public',
        };

        let postRes = postRequest(`${baseURL}/statuses`, postData);
        check(postRes, {
            'Status is 200 for new post': (r) => r.status === 200,
            'response time < 1000ms': (r) => r.timings.duration < 1000,
        }) || console.error(`Post request failed. Status: ${postRes.status}, Body: ${postRes.body}`);
    }

    sleep(1); // Nghỉ 1 giây để tránh quá tải
}
