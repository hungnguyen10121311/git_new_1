// Import thư viện của K6
import http from 'k6/http';
import { check, sleep } from 'k6';

// Các tham số thiết lập
export let options = {
    stages: [
        { duration: '5m', target: 10}, // Tăng tải từ 0 lên 100,000 users trong 5 phút
        { duration: '10m', target: 100 }, // Giữ tải ở 100,000 users trong 10 phút
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

// Hàm để chọn ngẫu nhiên một token
function getRandomToken() {
    return tokens[Math.floor(Math.random() * tokens.length)];
}

// Các API endpoint
const baseURL = 'https://cmc-sn.emso.vn/api/v1';

export default function () {
    // Chọn ngẫu nhiên một token cho mỗi lần thực thi
    const headers = {
        'Authorization': getRandomToken(),
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
    };

    // 70% user đọc dữ liệu (timeline)
    if (Math.random() < 0.7) {
        let res = http.get(`${baseURL}/timelines/home`, { headers });
        check(res, {
            'Status is 200 for timeline': (r) => r.status === 200,
        });

        // Lấy ID của post ngẫu nhiên từ kết quả
        let responseData = JSON.parse(res.body);
        if (responseData && responseData.length > 0) {
            const randomPost = responseData[Math.floor(Math.random() * responseData.length)];
            const postId = randomPost && randomPost.id;

            // 20% user tương tác (like + comment)
            if (Math.random() < 0.2857) { // 20% của tổng (20/70 = ~28.57%)
                // React (like) bài viết
                if (postId) {
                    let reactRes = http.post(`${baseURL}/statuses/${postId}/favourite`, 
                        JSON.stringify({ "custom_vote_type": "like", "page_id": null }), 
                        { headers }
                    );
                    check(reactRes, {
                        'Status is 200 for react (like)': (r) => r.status === 200,
                    });
                }

                // Comment bài viết
                if (postId) {
                    let commentData = {
                        id: Math.random().toString(),
                        status: 'test cmt k6',
                        in_reply_to_id: postId,
                        sensitive: false,
                        media_ids: [],
                        spoiler_text: '',
                        visibility: 'public',
                        poll: null,
                        extra_body: null,
                        tags: [],
                        page_owner_id: null
                    };
                    let commentRes = http.post(`${baseURL}/statuses`, JSON.stringify(commentData), { headers });
                    check(commentRes, {
                        'Status is 200 for comment': (r) => r.status === 200,
                    });
                }
            }
        }
    } 
    
    // 10% user tạo bài viết (post mới)
    else if (Math.random() < 0.1) {
        const postData = {
            id: null,
            media_ids: [],
            sensitive: false,
            visibility: 'public',
            extra_body: {},
            life_event: null,
            poll: null,
            place_id: null,
            status_background_id: null,
            mention_ids: null,
            reblog_of_id: null,
            post_type: null,
            page_id: null,
            page_owner_id: null,
            event_id: null,
            project_id: null,
            recruit_id: null,
            course_id: null,
            status_question: null,
            status_target: null,
            tags: [],
            status: 'post k6',
            scheduled_at: null,
            status_activity_id: null
        };

        let postRes = http.post(`${baseURL}/statuses`, JSON.stringify(postData), { headers });
        check(postRes, {
            'Status is 200 for new post': (r) => r.status === 200,
        });
    }

    sleep(1); // Nghỉ 1 giây để tránh quá tải
}
