import "./AccountUser.css";
import ClearIcon from '@mui/icons-material/Clear';
import {Avatar} from "@mui/material"
function AccountUser({username, nickname, isSearchList, onClear, onFollow}) {
    return(
        <div className="sugesstion__username">
                    <div className="username__left">
                        <span className="avatar">
                            <Avatar>{username?.charAt(0).toUpperCase()}</Avatar>
                        </span>
                        <div className="username__info">
                            <span className="username">{username}</span>
                            <span className="nickname">{nickname}</span>
                        </div>
                    </div>
                    {isSearchList ? (
                        <ClearIcon className="clear-icon" onClick={onClear}/>
                    ): (
                        <div className="button__follow" onClick={onFollow}>Follow</div>
                    )

                    }
                    
                </div>
    )
}
export default AccountUser