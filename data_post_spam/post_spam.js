// Import K6 modules
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 100 }, // Tăng số lượng VUs lên 1 trong 10 phút
    { duration: '10m', target: 100 }, // Tăng số lượng VUs lên 1 trong 10 phút   
  ],
};

// Mảng chứa các tokens
const tokens = [
  'Bearer RywajiSwzcSA2cgQElYjOktuvBt2duWDPQqBomK5cMo',
  'Bearer hgKONHVF209Sx67tz4EfZwnLNVyXXh_u-sVrC3veKQ8',
  'Bearer nfJgN2jv9ITtFEqYJm8ONe1PkoFi9as_qR6a95Yh-3M',
];

export default function () {
  const randomToken = tokens[Math.floor(Math.random() * tokens.length)];

  // Đăng bài viết
  const payload = {
    id: null,
    media_ids: [],
    sensitive: false,
    visibility: "public",
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
    status: "đây là data post spam k6",
    scheduled_at: null,
    status_activity_id: null,
  };

  let postRes = http.post(
    'https://lab-sn.emso.vn/api/v1/statuses',
    JSON.stringify(payload),
    {
      headers: {
        'Authorization': randomToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
      },
    }
  );

  check(postRes, {
    'post status is 200': (r) => r.status === 200,
    'response time is less than 2s': (r) => r.timings.duration < 2000,
  });

  // Sleep for a short duration to simulate real user behavior
  sleep(1);
}
