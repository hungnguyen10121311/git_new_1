import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 100,          // Số lượng Virtual Users (người dùng ảo)
    duration: '60s',   // Thời gian chạy test
    thresholds: {      // Đặt ngưỡng kiểm tra
        http_req_duration: ['p(95)<500'], // 95% thời gian phản hồi dưới 500ms
        http_req_failed: ['rate<0.01'],   // Tỷ lệ lỗi phải dưới 1%
    },
};

export default function () {
    const url = 'https://cmc-sn.emso.vn/api/v1/statuses';

    const payload = JSON.stringify({
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
        status: 'post text ngắn',
        scheduled_at: null,
        status_activity_id: null
    });

    const params = {
        headers: {
            'Authorization': 'Bearer nfJgN2jv9ITtFEqYJm8ONe1PkoFi9as_qR6a95Yh-3M',
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
        },
    };

    const response = http.post(url, payload, params);

    // Kiểm tra kết quả của yêu cầu POST
    check(response, {
        'is status 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
    });
}
