const getRecommendations = async (user) => {
    const { address, preferences } = user;
    const allRestaurants = await fetch('/api/restaurants').then(res => res.json());
    const allNormalUsers = await fetch('/api/normal-users').then(res => res.json());
  
    const filteredRestaurants = allRestaurants
      .filter(restaurant => preferences.some(pref => restaurant.foodTypes.includes(pref)))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  
    const filteredNormalUsers = allNormalUsers
      .filter(normalUser => preferences.some(pref => normalUser.preferences.includes(pref)))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
  
    return { restaurants: filteredRestaurants, normalUsers: filteredNormalUsers };
  };