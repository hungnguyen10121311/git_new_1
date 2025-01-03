import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from 'file:///C:/Users/Admin/Desktop/k6_project/config.js'; // Đường dẫn file config

// Các tham số thiết lập
export let options = {
    stages: [
        { duration: '1s', target: 1 }, // Tăng tải từ 0 lên 100,000 users trong 5 phút
        // { duration: '10m', target: 100000 }, // Giữ tải ở 100,000 users trong 10 phút
        // { duration: '5m', target: 0 }, // Giảm tải về 0 trong 5 phút
    ],
    thresholds: {
        'http_req_duration': ['p(95)<1000'], // 95% các request phải có thời gian đáp ứng dưới 1 giây
    },
};

// Hàm chọn ngẫu nhiên token và tạo headers chung
function getHeaders() {
    // Chọn ngẫu nhiên một account từ danh sách config
    const randomAccount = config.accounts_prod[Math.floor(Math.random() * config.accounts_prod.length)];
    console.log(`Using token for user: ${randomAccount.email}`);
    return {
        'Authorization': randomAccount.token,
        'Accept': config.commonHeaders['accept'],
        'Accept-Language': config.commonHeaders['accept-language'],
        'Cache-Control': config.commonHeaders['cache-control'],
        'Origin': config.commonHeaders['origin'],
        'Pragma': config.commonHeaders['pragma'],
        'Priority': config.commonHeaders['priority'],
        'Referer': config.commonHeaders['referer'],
        'Sec-CH-UA': config.commonHeaders['sec-ch-ua'],
        'Sec-CH-UA-Mobile': config.commonHeaders['sec-ch-ua-mobile'],
        'Sec-CH-UA-Platform': config.commonHeaders['sec-ch-ua-platform'],
        'Sec-Fetch-Dest': config.commonHeaders['sec-fetch-dest'],
        'Sec-Fetch-Mode': config.commonHeaders['sec-fetch-mode'],
        'Sec-Fetch-Site': config.commonHeaders['sec-fetch-site'],
        'User-Agent': config.commonHeaders['user-agent'],
    };
}

// Hàm chung để gửi POST request
function postRequest(url, data) {
    console.log(`Sending POST request to: ${url}`);
    console.log(`Request body: ${JSON.stringify(data)}`);
    return http.post(url, JSON.stringify(data), { headers: getHeaders() });
}

// Hàm chung để gửi GET request
function getRequest(url) {
    console.log(`Sending GET request to: ${url}`);
    return http.get(url, { headers: getHeaders() });
}

// Các API endpoint
const baseURL = `${config.baseUrl}/api/v1`;

export default function () {
    // 70% user đọc dữ liệu (timeline)
    if (Math.random() < 0.7) {
        let res = getRequest(`${baseURL}/timelines/home`);
        console.log(`Response from GET ${baseURL}/timelines/home: ${res.status}`);
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
                    console.log(`Response from POST ${baseURL}/statuses/${postId}/favourite: ${reactRes.status}`);
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
                    console.log(`Response from POST ${baseURL}/statuses: ${commentRes.status}`);
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
        console.log(`Response from POST ${baseURL}/statuses: ${postRes.status}`);
        check(postRes, {
            'Status is 200 for new post': (r) => r.status === 200,
            'response time < 1000ms': (r) => r.timings.duration < 1000,
        }) || console.error(`Post request failed. Status: ${postRes.status}, Body: ${postRes.body}`);
    }

    sleep(1); // Nghỉ 1 giây để tránh quá tải
}
