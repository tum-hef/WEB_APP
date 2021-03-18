import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

const styles = {

}

const SmallInfoTag = (props: any) => {
    const { classes } = props;

    return (
        <div>
            <h1>Test</h1>
        </div>
    )
}

SmallInfoTag.propTypes = {
    classes: PropTypes.object.isRequired,
  };

export default withStyles(styles)(SmallInfoTag)