import React, { useRef, useState } from 'react';
import { Button, Tree, Space, TreeInstanceFunctions, TreeNodeModel } from 'tdesign-react';
import { Icon } from 'tdesign-icons-react';
import { cloneDeepWith } from 'lodash-es';
import { TreeOptionData } from '../../common';

let idx = 2;

type IOptionType = TreeOptionData & {
  icon: string;
  label: string;
  value: string;
};

export default () => {
  const [items, setItems] = useState<IOptionType[]>([
    {
      icon: '',
      label: 'node1',
      value: 'node1',
    },
    {
      icon: '',
      label: 'node2',
      value: 'node2',
    },
  ]);

  // const treeRef = useRef(null);
  const treeRef = useRef<TreeInstanceFunctions<IOptionType>>(null);
  type TreeOptionNodeModel = TreeNodeModel<IOptionType>;

  const renderIcon = (node: TreeOptionNodeModel) => {
    const { data } = node;
    let name = 'file';
    // console.log('node.getChildren()', node, node.getChildren());
    if (node.getChildren(false)) {
      if (node.expanded) {
        name = 'folder-open';
      } else {
        name = 'folder';
      }
    }
    if (data.icon) {
      name = data.icon;
    }
    // console.log('renderIcon', name);
    return <Icon name={name} />;
  };

  const check = (node: TreeOptionNodeModel) => {
    console.info('check:', node);
  };

  const changeIcon = (node: TreeOptionNodeModel) => {
    const newData = cloneDeepWith(items, (item) => {
      if (item.value === node.value) {
        return {
          ...item,
          icon: item.icon === 'folder' ? 'folder-open' : 'folder',
        };
      }
    });

    console.log('newData', newData);
    setItems(newData);
  };

  const getInsertItem = () => {
    let item = null;
    idx += 1;
    const value = `t${idx}`;
    item = {
      icon: '',
      label: value,
      value,
    };
    return item;
  };

  const append = (node?: TreeOptionNodeModel) => {
    const item = getInsertItem();
    if (item && treeRef.current) {
      if (!node) {
        treeRef.current.appendTo('', item);
      } else {
        treeRef.current.appendTo(node.value, item);
      }
    }
  };

  const remove = (node: TreeOptionNodeModel) => {
    treeRef.current?.remove(node.value);
  };

  const renderOperations = (node: TreeOptionNodeModel) => (
    <>
      <Button size="small" variant="base" style={{ marginLeft: '10px' }} onClick={() => check(node)}>
        检查节点信息
      </Button>
      <Button size="small" variant="base" style={{ marginLeft: '10px' }} onClick={() => changeIcon(node)}>
        变更图标
      </Button>
      <Button size="small" variant="base" style={{ marginLeft: '10px' }} onClick={() => append(node)}>
        添加子节点
      </Button>
      <Button size="small" variant="base" style={{ marginLeft: '10px' }} theme="danger" onClick={() => remove(node)}>
        删除
      </Button>
    </>
  );

  return (
    <Space direction="vertical">
      <h3 className="title">state:</h3>
      <Tree
        ref={treeRef}
        data={items}
        hover
        expandAll
        activable
        checkable
        expandOnClickNode={false}
        line
        icon={renderIcon}
        operations={renderOperations}
      />
      <h3 className="title">api:</h3>
      <div className="operations">
        <Button theme="primary" onClick={() => append()}>
          插入一个根节点
        </Button>
      </div>
    </Space>
  );
};
