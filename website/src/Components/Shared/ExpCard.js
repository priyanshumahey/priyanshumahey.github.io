import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';

export default function MultiActionAreaCard(props) {
  return (
    <span style={{display:"inline-flex", padding:"0.5vw"}}>
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="175"
          image={props.image}
          alt={props.alt}
        />
        <CardContent>
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
          Website
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