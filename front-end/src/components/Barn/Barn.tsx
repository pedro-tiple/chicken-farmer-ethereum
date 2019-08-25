import React from 'react';
import './Barn.scss';

export interface Props {
  barn: object;
}

export interface State {
  chickens: Array<object>;
  feed: number;
}

export class Barn extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      chickens: [],
      feed: 0,
    };
  }

  async componentDidMount() {

  }
}
