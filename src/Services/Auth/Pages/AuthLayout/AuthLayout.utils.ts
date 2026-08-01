interface GetRedirectPathParams {
    fromLocation?: string;
    selectedSchool?: string;
}

export const getRedirectPath = ({ fromLocation, selectedSchool }: GetRedirectPathParams) => {

    if (fromLocation) {
        return fromLocation;
    }


    if (selectedSchool) {
        return `/admin/schools/${selectedSchool}`;
    }

    return `/admin`;
}