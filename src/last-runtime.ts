function getLastRuntime() {
    // TODO: get the last runtime from the database
    // return the current time minus 1 hour
    return new Date(new Date().getTime() - 60 * 60 * 1000);
}

function setLastRuntime(currentDateTime: number) {
    // TODO: set the last runtime in the database
    return true;
}

export default { getLastRuntime, setLastRuntime };
