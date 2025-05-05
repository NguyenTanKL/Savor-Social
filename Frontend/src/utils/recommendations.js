import { BACKENDURL } from "./const";
export const getRecommendations = async (user) => {
  const { address, preferences, following } = user;
  console.log("🔥 Danh sách following nhận từ Reddit:", following);

  const allRestaurants = await fetch(`${BACKENDURL}/api/user/restaurants`).then(res => res.json());
  const allNormalUsers = await fetch(`${BACKENDURL}/api/user/normal-users`).then(res => res.json());

  // Loại bỏ những người đã follow cho cả hai loại
  const unfollowedNormalUsers = allNormalUsers.filter(normalUser => !following.includes(normalUser._id.toString()));
  const unfollowedRestaurants = allRestaurants.filter(restaurant => !following.includes(restaurant._id.toString()));

  // Lọc người dùng có sở thích chung
  let filteredNormalUsers = unfollowedNormalUsers.filter(normalUser =>
    preferences.some(pref => normalUser.preferences.includes(pref))
  );

  let filteredRestaurants = unfollowedRestaurants.filter(restaurant =>
    preferences.some(pref => restaurant.foodTypes.includes(pref))
  );

  // Nếu không có sở thích chung, chọn ngẫu nhiên
  if (filteredRestaurants.length === 0) {
    filteredRestaurants = unfollowedRestaurants.sort(() => Math.random() - 0.5).slice(0, 5);
  } else {
    filteredRestaurants = filteredRestaurants.sort((a, b) => b.rating - a.rating).slice(0, 5);
  }

  if (filteredNormalUsers.length === 0) {
    filteredNormalUsers = unfollowedNormalUsers.sort(() => Math.random() - 0.5).slice(0, 5);
  } else {
    filteredNormalUsers = filteredNormalUsers.sort((a, b) => b.points - a.points).slice(0, 5);
  }

  return { restaurants: filteredRestaurants, normalUsers: filteredNormalUsers };
};