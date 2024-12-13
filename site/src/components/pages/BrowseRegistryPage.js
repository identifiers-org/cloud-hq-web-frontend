import React from 'react';

import NamespaceList from '../BrowseRegistryPage/NamespaceList';
import PageTitle from '../common/PageTitle';

import { useMatomo } from '@jonkoops/matomo-tracker-react';

class BrowseRegistryPage extends React.Component {
  constructor (props) {
    super(props);

    const params = new URLSearchParams(window.location.search);

    this.state = {
      query: params.get('query') || ''
    };
  }

  componentDidMount() {
    const { trackPageView } = this.props.matomo;
    trackPageView();
  }

  render() {
    const { query } = this.state;

    return (
      <>
        <PageTitle
          icon="icon-database"
          title="Registry"
          description="This is the list of Prefixes currently registered in Identifiers.org database.
                       Clicking on one will show additional details and the related providers."
        />

        <div>
          <NamespaceList query={query} />
        </div>
      </>
    );
  }
}

export default (props) => {
  const matomo = useMatomo();
  return <BrowseRegistryPage {...props} matomo={matomo} />
}