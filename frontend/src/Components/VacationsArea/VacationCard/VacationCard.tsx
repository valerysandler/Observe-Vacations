import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import VacationModel from '../../../Models/VacationModel';
import config from '../../../Utils/Config';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import vacationsStore, { authStore } from '../../../Redux/Store';
import followService from '../../../Services/FollowService';
import vacationsService from '../../../Services/VacationService';
import { deleteVacationAction } from '../../../Redux/VacationsState';
import authService from '../../../Services/AuthService';
import UserModel from '../../../Models/UserModel';
import { createTheme } from '@mui/material';
import notifyService from '../../../Services/NotifyService';



interface VacationCardProps {
    vacation: VacationModel;
}

// MUI Theme
const theme = createTheme();

export default function VacationCard(props: VacationCardProps) {

    const navigator = useNavigate();
    const [follow, setFollow] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [user, setUser] = useState<UserModel>();

    useEffect(() => {
        const isAdmin = authService.isAdmin();
        setIsAdmin(isAdmin);
    }, []);

    useEffect(() => {
        const user = authStore.getState().user;
        setUser(user);
    }, []);
    async function handleFollow() {
        try {
            if (!follow) {
                await followService.addFollow(user.userId, props.vacation.vacationId);
                setFollow(true);
            }
            else {
                console.log(user);
                await followService.removeFollow(user.userId, props.vacation.vacationId);
                setFollow(false);
            }

        }
        catch (err: any) {
            notifyService.error(err.message);
        }
    }



    async function handleDelete(id: number) {
        try {
            await vacationsService.deleteVacation(id);
            vacationsStore.dispatch(deleteVacationAction(id));
            alert("Vacation deleted");
        }
        catch (err: any) {
            alert(err.message);
        }
    }

    return (
        <Card sx={{
            maxWidth: 445,
            maxHeight: 420,
            height: 380,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.8)",

        }} >
            <CardMedia
                component="img"
                height="250"
                image={config.urls.vacationsImages + props.vacation.vacationImage}
                alt={props.vacation.vacationName}
            />
            <CardContent>
                <Typography variant="body1" color="dark">
                     {props.vacation.vacationName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Price: {props.vacation.vacationPrice}$
                </Typography>
            </CardContent>
            {!isAdmin ?
                <CardActions disableSpacing>
                    <IconButton aria-label="add to favorites" onClick={handleFollow}>
                        {follow ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                </CardActions>
                :
                <CardActions disableSpacing>
                    <IconButton aria-label="edit" onClick={() => { navigator("/update-vacation/" + props.vacation.vacationId) }}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => { handleDelete(props.vacation.vacationId) }}>
                        <ClearIcon />
                    </IconButton>
                </CardActions>
            }
        </Card>
    );
}