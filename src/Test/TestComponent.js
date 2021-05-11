import React from "react";

class bumfuq extends React.Component {
  constructor(props) {
    super(props);
    state = {
      var1: val1,
      var2: val2
    };
    this.member1 = null;
    this.member2 = null;
  }

  setStateValues(newVal1, newVal2) {
    this.setState({
      var1: newVal1,
      var2: newVal2
    });
  }

  setMemberValues(newVal1, newVal2) {
    this.member1 = newVal1;
    this.member2 = newVal2;
  }

  render() {
    return (
      <>
        <component1 propValue={this.state.val1} />
      </>
    );
  }
}
