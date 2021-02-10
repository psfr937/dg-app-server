import React from 'react';

import Grid from './layout/Grid';
import Header from './elements/Header';
import Title from './elements/Title';
import Body from './elements/Body';
import Weather from './elements/Weather';
import Footer from './elements/Footer';

const style = {

  container: {
    backgroundColor: '#efefef',
    padding: '20px 0',
    fontFamily: 'sans-serif',
    width: '70%',
    margin: 'auto'
  },

  main: {
    maxWidth: '500px',
    width: '100%',
  },

};

function Email(content) {
  return (
    <div style={style.container}>
      <Grid style={style.main}>
        <Header />
        <Body>
          {content}
        </Body>
        <Footer />
      </Grid>
    </div>
  );
}

export default Email;

