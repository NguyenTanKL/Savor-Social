export const getRecommendations = async (user) => {
    const { preferences } = user;
    const allRestaurants = await fetch('/api/auth/restaurants').then(res => res.json());
    const allNormalUsers = await fetch('/api/auth/normal-users').then(res => res.json());
  
    let filteredRestaurants = allRestaurants;
    if (preferences.length > 0) {
      filteredRestaurants = allRestaurants
        .filter(restaurant => preferences.some(pref => restaurant.foodTypes.includes(pref)))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
    } else {
      filteredRestaurants = allRestaurants
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
    }
  
    let filteredNormalUsers = allNormalUsers;
    if (preferences.length > 0) {
      filteredNormalUsers = allNormalUsers
        .filter(normalUser => preferences.some(pref => normalUser.preferences.includes(pref)))
        .sort((a, b) => b.points - a.points)
        .slice(0, 5);
    } else {
      filteredNormalUsers = allNormalUsers
        .sort((a, b) => b.points - a.points)
        .slice(0, 5);
    }
  
    return { restaurants: filteredRestaurants, normalUsers: filteredNormalUsers };
  };