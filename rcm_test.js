import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 1000,          // Số lượng Virtual Users (người dùng ảo)
    duration: '600s',   // Thời gian chạy test
    thresholds: {      // Đặt các ngưỡng kiểm tra
        http_req_duration: ['p(95)<500'], // 95% thời gian phản hồi dưới 500ms
        http_req_failed: ['rate<0.01'],   // Tỷ lệ lỗi phải dưới 1%
    },
};

export default function () {
    const url1 = 'https://gorse-sn.emso.vn/api/recommend/112759797279956887/default?n=200&offset=0';
    
    // Gửi yêu cầu GET đến API 1
    const response1 = http.get(url1, {
        headers: { 'Content-Type': 'application/json' },
    });

    // Kiểm tra API 1
    check(response1, {
        'API 1: is status 200': (r) => r.status === 200,
        'API 1: response time < 500ms': (r) => r.timings.duration < 500,
    });
} 