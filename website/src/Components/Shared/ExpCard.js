import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';

export default function MultiActionAreaCard(props) {
  return (
    <span style={{display:"inline-flex", padding:"0.5vw" }}>
    <Card sx={{ maxWidth: 345, width:'30vh', boxShadow:"0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)"}}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="175"
          image={props.image}
          alt={props.alt}
        />
        <CardContent style={{backgroundColor:props.color}}>
          <Typography gutterBottom variant="h5" component="div">
            {props.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {props.text}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <a target="_blank" rel="noreferrer"  href={props.website}>
        <Button size="small" color="primary">
          {props.website_but_name}
        </Button>
        </a>
        {props.extra_button1}
        {props.extra_button2}
        {props.extra_button3}
      </CardActions>
    </Card>
    </span>
  );
}