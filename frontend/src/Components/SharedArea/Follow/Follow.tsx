import { CardActions, IconButton } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useEffect, useState } from "react";
import { Unsubscribe } from "redux";
import { vacationsStore } from "../../../Redux/Store";
import { updateVacationAction } from "../../../Redux/VacationsState";
import authService from "../../../Services/AuthService";
import followService from "../../../Services/FollowService";
import notifyService from "../../../Services/NotifyService";
import vacationsService from "../../../Services/VacationService";
import { FavoriteOutlined } from "@material-ui/icons";


interface FollowProps {
    vacationId: number;
}

function Follow(props: FollowProps): JSX.Element {

    const [isFollow, setIsFollow] = useState<boolean>(false);

    useEffect((async () => {
        try {
            let unsubscribe: Unsubscribe;

            if (authService.isLoggedIn()) {
                let userFollows = await vacationsService.getAllFollowedVacations();
                const isFollowedVacations = userFollows.find(f => f.vacationId === props.vacationId);
                if (isFollowedVacations) setIsFollow(true);
                else if (!isFollowedVacations) setIsFollow(false);

                // Listen to followed vacations changes
                unsubscribe = vacationsStore.subscribe(() => {
                    userFollows = vacationsStore.getState().followedVacations;
                    const isVacationFollowed = userFollows.find(f => f.vacationId === props.vacationId);
                    if (isVacationFollowed) setIsFollow(!isFollow);
                    else if (!isVacationFollowed) setIsFollow(false);
                });
            }

            return () => {unsubscribe()};
        }
        catch (err: any) {
            notifyService.error(err.message);
        }
    }) as any, []);

    const addFollow = async () => {
        try {
            await followService.addFollow(props.vacationId);
            const followedVacation = await vacationsService.getOneVacation(props.vacationId);
            vacationsStore.dispatch(updateVacationAction(followedVacation));
            setIsFollow(!isFollow);
            alert("followed");
        }
        catch (err: any) {
            notifyService.error(err.message);
        }
    }

    const removeFollow = async () => {
        try {
            await followService.removeFollow(props.vacationId);
            const unfollowedVacation = await vacationsService.getOneVacation(props.vacationId);
            vacationsStore.dispatch(updateVacationAction(unfollowedVacation));
            setIsFollow(!isFollow);
            alert("unfollowed");
        }
        catch (err: any) {
            notifyService.error(err.message);
        }
    }

    return (
        <CardActions>
            {isFollow ? <IconButton onClick={removeFollow}><FavoriteIcon /></IconButton> : <IconButton onClick={addFollow}><FavoriteBorderIcon /></IconButton>}
        </CardActions>


    );
}

export default Follow;