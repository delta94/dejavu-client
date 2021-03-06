import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Popover, List, Badge, Avatar, Icon, Empty } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import Spin from 'elements/Spin/Second';
import * as notificationPopoverActions from '_redux/actions/notificationPopover';
import * as notificationActions from '_redux/actions/notifications';
import { fromNow, truncate } from 'utils/utils';
import { history } from 'utils/history';
import styles from './index.module.less';


class NotificationPopover extends React.PureComponent {
    state = {
        visible: false,
    }

    handleVisibleChange = visible => {
        const { fetchNotificationPopovers, resetNotificationPopovers } = this.props;
        this.setState({
            visible,
        });
        if (visible) fetchNotificationPopovers();
        else resetNotificationPopovers();
    }

    handleScroll = e => {
        const element = e.srcElement;
        if (element.scrollTop === element.scrollHeight - 474) {
            const { fetchOldNotificationPopovers, loading, oldLoading } = this.props;
            if(!loading && !oldLoading) fetchOldNotificationPopovers();
        }
    }
    
    handleViewAll = () => {
        this.handleVisibleChange(false);
    }

    handleViewNoti = item => {
        if (!item.seen) {
            const { readNoti } = this.props;
            readNoti(item._id);
        }
        this.handleVisibleChange(false);
        switch(item.type) {
            case 1:
            case 2:
                history.push('/account/followers');
                break;
            default:
                history.push('/notifications');
        }
    }

    getContent = () => {
        let {
            notificationPopover: notifications,
            loading,
            //oldLoading
        } = this.props;
        const content = (notifications === null || _.isEmpty(notifications)) ? (
            <div className={styles.empty}>
                <div className={styles.inlineDiv}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No notification"/>
                </div>
            </div>
        ) : (
            <Scrollbars autoHeight autoHeightMax={474} onScroll={this.handleScroll}>
                <List
                    dataSource={notifications}
                    rowKey={item => item._id + _.uniqueId("notification_popover_")}
                    renderItem={item => (
                        <div className={styles.notiItem} onClick={() => this.handleViewNoti(item)}>
                            <List.Item style={{ background: (item.seen ? 'inherit' : 'rgba(145, 238, 28, 0.1)')}}>
                                <List.Item.Meta
                                    avatar={<Avatar src={item.avatar} size={36} />}
                                    title={<span>{truncate(item.content, 92)}</span>}
                                    description={<span style={{ fontSize: 13, color: 'gray'}}>{ fromNow(item.createdAt) }</span>}
                                />
                            </List.Item>
                        </div>
                    )}
                />
            </Scrollbars>
        );
        return (
            <Spin
                spinning={loading || notifications === null}
                delay={0}
                fontSize={8}
            >
                <div>{content}</div>
                <div className={styles.viewAll} onClick={this.handleViewAll}><Link to="/notifications">View all</Link></div>
            </Spin>
        );
    }

    render() {
        const { numOfUnreadNotification: unread } = this.props;
        const { visible } = this.state;
        let count = 0;
        if (unread > 0)
            count = <Avatar style={{ background: 'red', fontSize: '11px' }} size={18}>{unread > 99 ? '99+' : unread}</Avatar>;
        const trigger = (
            <span className={styles.trigger}>
                <Badge
                    count={count}
                    style={{ boxShadow: 'none' }}
                    className={styles.badge}
                    overflowCount={9}
                >
                    <Icon type="bell" style={{ fontSize: 18 }}/>
                </Badge>
            </span>
        );
        const content = this.getContent();
        if (!content)
            return trigger;
        return (
            <Popover
                placement="bottomRight"
                content={content}
                popupClassName={styles.popover}
                trigger="click"
                arrowPointAtCenter
                popupAlign={{ offset: [20, 0] }}
                onVisibleChange={this.handleVisibleChange}
                visible={visible}
            >
                {trigger}
            </Popover>
        )
    }
}

const mapStateToProps = state => ({
    numOfUnreadNotification: state.global.numOfUnreadNotification,
    loading: state.loading['fetchNotificationPopovers'] || false,
    oldLoading: state.loading['fetchOldNotificationPopovers'] || false,
    notificationPopover: state.notificationPopover.list,
});

const mapDispatchToProps = dispatch => ({
    fetchNotificationPopovers: () => dispatch(notificationPopoverActions.fetchNotificationPopovers()),
    fetchOldNotificationPopovers: () => dispatch(notificationPopoverActions.fetchOldNotificationPopovers()),
    resetNotificationPopovers: () => dispatch(notificationPopoverActions.resetNotificationPopovers()),
    readNoti: id => dispatch(notificationActions.readNoti(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(NotificationPopover);