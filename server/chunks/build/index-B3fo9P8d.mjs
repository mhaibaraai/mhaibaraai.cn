function findPageBreadcrumb(navigation, path, options) {
  if (!navigation?.length || !path) {
    return [];
  }
  return navigation.reduce((breadcrumb, link) => {
    if (path && (path + "/").startsWith(link.path + "/")) {
      if (path !== link.path || options?.current || options?.indexAsChild && link.children) {
        breadcrumb.push(link);
      }
      if (link.children) {
        breadcrumb.push(...findPageBreadcrumb(link.children.filter((c) => c.path !== link.path || c.path === path && options?.current && options?.indexAsChild), path, options));
      }
    }
    return breadcrumb;
  }, []);
}
function findPageChildren(navigation, path, options) {
  if (!navigation?.length || !path) {
    return [];
  }
  return navigation.reduce((children, link) => {
    if (link.children) {
      if (path === link.path) {
        return link.children.filter((c) => c.path !== path || options?.indexAsChild);
      } else if ((path + "/").startsWith(link.path + "/")) {
        return findPageChildren(link.children, path, options);
      }
    }
    return children;
  }, []);
}

export { findPageChildren as a, findPageBreadcrumb as f };
//# sourceMappingURL=index-B3fo9P8d.mjs.map
