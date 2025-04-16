import React from "react";

  const rows = [
    { id: 1, code:'ABCD' ,name: 'Voucher Tết',description:'Giảm 50%', releaseDate: '20/11/2024', expirationDate: '10/1/2025', station:'Đã sử dụng',by:'Huy Thái' },
    { id: 2, code:'ABDF',name: 'Voucher Tết',description:'Giảm 50%', releaseDate: '20/11/2024', expirationDate: '10/1/2025', station:'Đã sử dụng',by:'Huy Thái' },
    { id: 3, code:'ABFG', name: 'Voucher Tết',description:'Giảm 50%', releaseDate: '20/11/2024', expirationDate: '10/1/2025', station:'Đã sử dụng',by:'Huy Thái' },
    
  ];
  
  const paginationModel = { page: 0, pageSize: 5 };
  
function VouchersPage() {
    const userData = {
        name: 'Hadilao.vn',
        job: 'Nhà hàng lẩu Hadilao',
        followers: 1234,
        following: 567,
        posts: 9,
        socialLinks: [
            { platform: 'Facebook', url: 'https://facebook.com/username' },
            { platform: 'Twitter', url: 'https://twitter.com/username' },
            { platform: 'LinkedIn', url: 'https://linkedin.com/in/username' }
        ]
    };
    return(
        <div>
            <h1>User Voucher Page</h1>
        </div>
    )
}
export default VouchersPage